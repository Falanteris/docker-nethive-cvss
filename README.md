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


If you have a different producer, server location, or IP/CIDR combination, you can change the *env variable* (`-e`) arguments in the `cvss` bash script to your liking

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

       1. EVENT_UPDATE: this event indicates that an nvd-dataset has a new updated version
       2. EVENT_UPDATE_DONE: this event indicates that an nvd-dataset has done updating.
       3. SUM: this event indicates that a summarizing process has been finished.

# Wait, what is this?

Good question. This is basically an application based on our research of the NVD Dataset. Long story short, our research concludes that in a span of 3 years since 2017, classified vulnerabilities no matter the environment has a good chance of having the sam e CVSSv3 Vector string, in exception of PR (Privilege Required) Vector. (https://www.overleaf.com/read/fyzfxgfjrfs)
