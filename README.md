# NVDEELYSIS 
This tool is designed to evaluate CVSS3 Information NVD JSON Datasets. It combines Node.js Events and Asynchronous File Reading with Python Data Science tools such as Pandas and Matplotlib for Data Visualization.

# Instructions

    $ git clone https://github.com/Falanteris/docker-nethive-cvss/
    $ docker build -t nethive-cvss .
    $ chmod +x cvss
    $ ./cvss
*side note* : this assumes a few things
*1. You have a kafka server running in localhost port 9092*
*2. You have a producer called 'CONSUMER' running in that server*

If you have a different producer or server location, you can change the *env variable* (`-e`) arguments to your liking
