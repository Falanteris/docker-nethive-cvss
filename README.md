<h1> Reviving in due time.. </h1>
[![Build Status](http://rk-sragen.site:8080/buildStatus/icon?job=CvssApi)](http://rk-sragen.site:8080/job/CvssApi/) 
[![buddy pipeline](https://app.buddy.works/rayhanrts/docker-nethive-cvss/pipelines/pipeline/278971/badge.svg?token=9114cadb0556693d535af80caad668061508781364e36c932734c3058503fa9c "buddy pipeline")](https://app.buddy.works/rayhanrts/docker-nethive-cvss/pipelines/pipeline/278971)
<h1 align="center">
  <br>
  <a href="https://github.com/Falanteris/docker-nethive-cvss/">
  <img src="graphics/logo.png" align="center" alt="nethive-logo"></a>
  <br>
</h1>

<p align="center">
  <a href="#pre-requisites">Pre-Requisites</a> •
  <a href="#installation">Installation</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#control-panel-tools">Control Panel Installation</a>
</p>

# CVSS Tag-Based Calculation System
This application directly extracts data from NVD regularly and can perform integration if the user desires.

## New Feature: Standalone API version

Now you can run this as a fully-fledged API in your server. Installation process remains the same. However, if
you still want to use the classic pipeline you would need to provide an Environment Variable MODE to PIPELINE
when running it. Of course, the API will still be up and running too.

The API will run on port 5000 by default. However, you can change that by providing the docker container an extra
Environment Variable "CVSS_PORT".

So running it would look something like this:

        $ docker run -it --network=host -e CVSS_PORT=3000 nethive.me/cvss

This would run the app on port 3000

## Pre-Requisites

1. Apache Kafka

You can get Apache Kafka from here : https://www.apache.org/dyn/closer.cgi?path=/kafka/2.6.0/kafka_2.13-2.6.0.tgz

You can follow the Apache Kafka quickstart tutorial here, which would mention the link above : https://kafka.apache.org/quickstart

2. Nethive SIEM

You can get our SIEM system from here : https://github.com/chrisandoryan/Nethive-Project

## Control Panel Tools
You can get the control panel tools here: https://github.com/Falanteris/nethive-cvss-utils

## Installation
1. Directly Pulling and Running the image.

Currently, we have created a docker registry that stores the image. It's hosted in http://nethive.me You can login as a pull-only user with the following credentials.

    $ docker login -u cvss -p pullmyimage nethive.me
    $ docker pull nethive.me/cvss
    

this would pull the image directly into your docker system and install it, depending on your connection speed, it may take a while. The image is also being re-build everyday with Jenkins CI. So that newer users can quickly catch up to speed to the latest changes in NVD data as the image builds includes it's integration as well.

After pulling, you can navigate yourself to the location of this control panel folder and execute the *cvss* bash script. If you open the script, it contains environment variables that you can modify to fit your system's architecture (e.g. remote kafka or ES server, different secret, different ES index, etc.). Once you're done, execute the script and the system should run like a charm.

You can interact with the summarizer's docker container using the scripts we've included in the *docker-utils* folder. There you will find things that allows you to trigger updates, check for services, and even accessing the container's bash itself.

2. Building from Scratch.

If you don't like typing docker login passwords and/or prefer to build it your own, then we've got you covered!. Clone the repository, build it under the tag-name *nethive-cvss* like so.

     $ git clone https://github.com/Falanteris/docker-nethive-cvss
     $ cd docker-nethive-cvss
     $ docker build -t nethive.me/cvss .

And we're done!. The nethive-cvss system would run smoothly. Of course you can edit the *cvss* script to fit your system architecture. But other than that, it should accomplish the same thing that the first method did. Only with more processing power required since you would need to build the image yourself. 

## Quick-Start

If you have downloaded our Control Panel. Once you navigate to it's directory, you can see a script called 'cvss'.
You can simply quickstart the summarizer by executing it

     $ ./cvss

And that's it, the summarizer would begin operation.


# Update on August, 30th 2020

    1. Implemented Py.test easy testing.
    
# Update On December, 25th 2019

    1. Separated the web API implementation on piper2.0.js
    2. Results also contains errors for debugging, and likelyhood percentage.

# Registering Event Listeners

As you would see, there's a new script called  `registerEventListener.js` and `event-config.json`. You can use these as event listener in your system. Simply install `Node v10.0+` (no npm needed) and modify the event-config.json as you please.

The `event-config.json` has a rule of thumb you have to follow in order to get the event listener to work properly. The following is the explanation of the properties within `event-config.json`.

               {
                listenerfile: <this is the .json file that others with authority can use to stop/start your processess,
                stopcommands : <an array, filled with a 2-length array (tuple), that contains the command (string), and the arguments <tuple> to stop all the necessary services.
                startcommands : <the format is similar to stopcommands, but this one is for restarting the applications.>
               }
            
*Further Explanation*

`listenerfile` - is the file that acts as a pointer to your processes. Others with authority can manipulate it with consideration.

`stopcommands` - is the *stop commands* when you need to shut down some services when invoked by the person manipulating the json output file.

`startcommands` - is the *start commands* when you need to reboot some services when invoked by the person manipulating the json output file.

Regarding the output, it will be a `.json` file you specified in the `listenerfile` property of the config file. The format is the following:

        {
                pid:<the process id of the listener>
                active:<true|false>
                start: <the start time of the systems>
        }

Yes, as you may guess, you only need to manipulate the `active` property between `true` or `false`. Quite simple, huh?. After the `stopcommands` have been executed, there will be a new property called `termination` which indicates the time when the *stopcommands* have been executed. When restarted, the json config file will change the `termination` property into `lastTermination`, with the same value.

*SIDE NOTE* : You would need to use `sudo` as you run `registerEventListener.js` if you wish to place the listener file in a folder which require root privileges such as `var`.

# UPDATES


We now would rely on Docker Volumes to share data with other containers. in order to create a volume, you can do so by the following command.

        $ docker volume create <volume_name>
        
Once that is done, attach the volume into our container's `/var` directory by doing the following

        $ docker run -v <volume_name>:/var --name cvss -e PRODUCER=CONSUMER -e BOOTSTRAP_SERVER=192.168.100.5:9092 -e INTERFACE=192.168.100.5/24 -e ESLOC=http://localhost:9092 -e STOREINDEX=cvss nethive-cvss
        
The example given in the `cvss` bash script assumes you have a volume called `gearwork-volume`.

You can then view the status of the service, and modify it through another docker container connected to the same volume by accessing a file called `cvss.json`. You can then modify the active status to `true` or `false`.

        {
               ...
               active: <true|false> (default: true)
               ...
        }

As you can also see, we have provided a way for you to inject more env variables. They are `ESLOC` and `STOREINDEX`.
`ESLOC` is the location Elasticsearch server, (*refer to https://elasticsearch-py.readthedocs.io/en/master/ section SSL and Authentication for an example*). The `STOREINDEX` env is pretty straightforward. It's the name of the index you want to store the CVSS data in.

# NVDEELYSIS 

This tool is designed to evaluate CVSS3 Information NVD JSON Datasets. It combines Node.js Events and Asynchronous File Reading with Python Data Science tools such as Pandas and Matplotlib for Data Visualization.

# Instructions

    $ git clone https://github.com/Falanteris/docker-nethive-cvss/
    $ docker build -t nethive-cvss .
    $ chmod +x cvss
    $ ./cvss
    
**Side Note** : This assumes a few things

*1. You have a kafka server running in localhost port 9092*

*2. You have a producer called 'CONSUMER' running in that server*

*3. You're server environment is connected to interface with an IP/CIDR combinaton of 172.17.0.2/24*

*4. You have a MYSQL server running in your local machine

*5. You have an Elasticsearch running in localhost interface, port 9200*

*6. The elasticsearch index you wish to store the CVSS data in*

*7. you have a Docker Volume called gearwork-volume*

If any of these differ from what you prefer, you can change the *env variable* (`-e`) arguments in the `cvss` bash script to your liking, or the `-v` argument for volume binding.

# MYSQL Server Integration


You would need to configure a mysql server, a table called `paths` must be inserted in your specified database.

In order for the driver to connect, you'll have to specify an `env` variable called `MYSQL` that is filled with a `dsn` for said SQL. The format is `[username[:password]@][protocol[(address)]]/dbname[?param1=value1&...&paramN=valueN]`

For example: `test_user:test@/test`

Where 

        - test_user is the user is the user of the database
        - test (before the @) is the password
        - you can simply just write @ to specify that the database is located in localhost
        - and the final *test* is the database name.
 
Now if you were to add this to the docker container, you can use the `-e` argument again to specify the `MYSQL` environment
variable with the `dsn`

# Data Input Format

The data input format is pretty straightforward. We can accept data in JSON format with the following properties

        {
            vul : <the-type-of-vulnerability>,
            ip : <the-attacker-ip>,
            url : <SinkholePath or attacker's endpoint>
        }

The system can then work on these data, as well as other data you may want to include.

# Available Vulnerability

This is the `vul` property from the JSON input. Here are the following currently acceptable types:

*1. SQL Injection: You can put `SQLi` to indicate this in the data input*

*2. XSS: You can put `XSS` to indicate this in the data input*

*3. DDOS: Experimental, but you can also put `DDOS` in the data input*

# Relay Methods

This tool uses theturtle32's websocket ( https://www.npmjs.com/package/websocket ) module from npm to relay messages. The websocket is connected to port `8000`. However, you must acquire a `jwt` token given by the system in order to communicate with the WebSocket. 

Once you're able to establish a connection with the WebSocket, the data that would be spouted out from the server would have varying properties depending on the event. But you can classify them with the `EVENT_TYPE` property.

        {
        EVENT_TYPE:<an-event-type>,
        ...
        }

As of now, there're 3 types of events.

       1. UPDATE: this event indicates that an nvd-dataset has a new updated version
       2. EVENT_EXTRACT_DONE: this event indicates that an nvd-dataset has done updating.
       3. SUM: this event indicates that a summarizing process has been finished.

# Path APIs

These path APIs are located in the `path_apis` folder. Which contains the `insertpath` and `updatepath` binary file. You'll have to include the MYSQL env variable with a `dsn` string similar to the example above for this to work.

Each of these requires you to supply command-line arguments.

*insertpath*

This API is tasked with inserting a specific path information based on the user preferences. The syntax is the following.

               ./insertpath <path:string> <needs_authentication:<1 or 0>> <is_superuser:<1 or 0>>
               
*updatepath*

This API is tasked with updating a specific path information based on the user's preferences. The syntax is the following.

                ./updatepath <id:int> <path:string> <superuser:<1 or 0>> <authentication:<1 or 0>> 

# Wait, what is this?

Good question. This is basically an application based on our research of the NVD Dataset. Long story short, our research concludes that in a span of 3 years since 2017, classified vulnerabilities no matter the environment has a good chance of having the sam e CVSSv3 Vector string, in exception of PR (Privilege Required) Vector. (https://www.overleaf.com/read/fyzfxgfjrfs)
