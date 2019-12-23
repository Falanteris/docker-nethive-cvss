#!/usr/bin/env python3
from kafka import KafkaConsumer
from elasticsearch import Elasticsearch
import json

#import socket
import datetime
import subprocess
import os

#print("test")
#op  = open("kc.log","r+")
#op.close()
#sock.connect("/tmp/piper.sock");
try:
	es = Elasticsearch(
                [os.getenv("ESLOC")]
        )
except Exception as e:
	es = None;
	print("Cannot contact ES at that server, make sure you specify ESLOC env right..")
	pass

def call_summarizer(msg):
	result = subprocess.check_output(["node","merger.js",msg["vul"],msg["ip"],msg["url"]]).decode();
	try:
		print(result)
		result = json.loads(result);
		#return finaldata;
	except Exception as e:
		print("error: {}".format(str(e)))
		err = {}
		err["ERROR_MESSAGE"] = "An error occured while performing calculation.."
		return err;
	return json.loads(result);
def process_message(msg):
	msg = dict(msg)
	msg["processed_at"] = str(datetime.datetime.now())
	arg = {}
	# check properties, if it contains vul, ip, and url, perform calculation.
	if "vul" in msg and "ip" in msg and "url" in msg:
		arg["vul"] = msg["vul"]
		arg["ip"] = msg["ip"]
		arg["url"] = msg["url"]
		new_instance = {}
		new_instance["corr_id"] = msg["_id"]
		new_instance["SUMMARIZE_RESULT"] = call_summarizer(arg)
	return json.dumps(new_instance)

def log(msg):
	#global sock
	global es
	try:
		msg = json.loads(msg)
		msg = process_message(msg)
		if es:
			try:
				es.index(index=os.getenv("STOREINDEX"),body=msg);
			except Exception as e:
				print("An error occured while sending to index");
				print(e)
			return;
		print("Cannot send this to ES: {}".format(msg))
	#s = socket.connect("/tmp/piper.sock");
		#sock.send(msg.encode('utf8'));
		#print("message sent")
	except Exception as e:
		print(e)
		print("error in processing message");

	#op = open("kc.log","a+")
	#global op
	#op.write('INFO:{}\n'.format(msg))
#	op.close()
if __name__ == "__main__":
	#sock = socket.socket(socket.AF_UNIX,socket.SOCK_STREAM);
	#sock.connect("/tmp/piper.sock");
	#print("Added Socket")

#config = json.loads(open("kafka-config/conf.json").read())
#template = json.loads(open("event-template.json").read());
	producer = os.getenv("PRODUCER")
	server_port = os.getenv("BOOTSTRAP_SERVER")
	if not producer or not server_port:
		raise ValueError("PRODUCER and/or BOOTSTRAP_SERVER env not set.. ")
	print("Preparing to enable kafka consumer")
	consumer = KafkaConsumer(producer,bootstrap_servers=server_port)
	print("kafka consumer enabled..")
	print("Begin summarizer");
	for msg in consumer:
	#print(sys.stdout)
		log(msg.value.decode());
