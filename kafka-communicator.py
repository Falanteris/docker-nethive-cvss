#!/usr/bin/env python3
from kafka import KafkaConsumer
from elasticsearch import Elasticsearch
import json
#import socket
import datetime
import subprocess
import os
import time
import threading
from colorama import init, Fore, Back, Style


#print("test")

#op.close()
#sock.connect("/tmp/piper.sock");
esconfig = {

		"mappings":{
			"properties":{
                        "corr_id":{
                                "type":"text"
                        },
			"vul_tag":{
				"type":"text"
			},
                        "timestamp":{
                                "type":"date"
                        },
                        "SUMMARIZE_RESULT":{
                                "type":"object",
                                "properties":{
                                        "vector":{"type":"text"},
                                        "score":{"type":"float"},
                                        "severity":{"type":"text"},
                                        "errors":{
                                                "type":"object"
                                        },
                                        "likelyhood":{"type":"integer"}
                                }

                        }
			}
		}
	}

es_online = False;
kafka_online = False;

def call_summarizer(msg):
	result = subprocess.check_output(["node","merger.js",msg["vul"],msg["ip"],msg["url"]]).decode();
	try:
		print(result)
		result = json.loads(result);
		result["score"] = float(result["score"]);
		result["likelyhood"] = int(result["likelyhood"])
		#return finaldata;
	except Exception as e:
		print("error: {}".format(str(e)))
		err = {}
		err["ERROR_MESSAGE"] = "An error occured while performing calculation.."
		return err;
	return result;
def process_message(msg):
	msg = dict(msg)
	msg["timestamp"] = str(datetime.datetime.now().isoformat())
	arg = {}
	new_instance = {}
	# check properties, if it contains vul, ip, and url, perform calculation.
	if "vul" in msg and "ip" in msg and "url" in msg:
		arg["vul"] = msg["vul"]
		arg["ip"] = msg["ip"]
		arg["url"] = msg["url"]
		new_instance["corr_id"] = msg["_id"]
		new_instance["timestamp"] = msg["timestamp"]
		new_instance["vul_tag"] = msg["vul"]
		new_instance["SUMMARIZE_RESULT"] = call_summarizer(arg)
	return json.dumps(new_instance)
def send_cached_data():
	with open("kc.log","r+") as f:
		data = f.read();
		lists = data.split("\n")
		[es.index(index=os.getenv("STOREINDEX"),body=json.loads(msg)) for msg in lists];
		f.close();
	w_fd = open("kc.log","w");
	w_fd.write("");
	w_fd.close();

def log(msg):
	#global sock
	global es
	global es_online
	global log_not_empty
	try:
		msg = json.loads(msg)
		msg = process_message(msg)
		if bool(es):
			try:
				es.index(index=os.getenv("STOREINDEX"),body=msg);
				if log_not_empty:
					threading.Thread(target=send_cached_data,args=(es));
			except Exception as e:
				if not bool(es.ping()) and bool(es_online):
					es_online = False
					print("[!] ElasticSearch seems to have disconnected.. trying to re establish connection")
					td = threading.Thread(target=start_elastic);
					td.start();
				if not bool(es_online):
					op = open("kc.log","w")
					print("[+] ElasticSearch is offline.. sending results to a log file..")
					op.write('{}\n'.format(msg))
					op.close()
					log_not_empty = True;

				print(Fore.YELLOW+"[!] Cannot send this result to ES: {}".format(msg))
				print(e)
				print(Style.RESET_ALL)
			return;
		
	#s = socket.connect("/tmp/piper.sock");
		#sock.send(msg.encode('utf8'));
		#print("message sent")
	except Exception as e:
		print(e)
		print("error in processing message");


#	op.close()
def start_kafka():
	global kafka_online
	producer = os.getenv("PRODUCER")
	server_port = os.getenv("BOOTSTRAP_SERVER")
	if not producer or not server_port:
		raise ValueError("PRODUCER and/or BOOTSTRAP_SERVER env not set.. ")
	print("Preparing to enable kafka consumer")
	while not bool(kafka_online):
		try:
			consumer = KafkaConsumer(producer,bootstrap_servers=server_port)
			kafka_online = True
			return consumer;
		except Exception as e:
			print(e)
			print("[!] Kafka seems to be offline, retrying in 5 seconds..");
			time.sleep(5);
	
es = None;
log_not_empty = False;
def start_elastic():
	global es;
	global es_online
	try:
		es = Elasticsearch(
                [os.getenv("ESLOC")]
        )
		print("[!] Waiting for ElasticSearch to respond");
		while not es_online:
			if es.ping():
				es_online = True
				print(Fore.GREEN+"[+] Elasticsearch is online.. contacting kafka server..");
			else:
				print(Fore.YELLOW+"[-] Elasticsearch seems to be offline.. resetting in 5 seconds")
				time.sleep(5)
		response = es.indices.create(index="nethive-cvss",body=esconfig,ignore=400)
		print("response : {}".format(response))
		print(Style.RESET_ALL)
	except Exception as e:
		print(e)
		pass

if __name__ == "__main__":
	#sock = socket.socket(socket.AF_UNIX,socket.SOCK_STREAM);
	#sock.connect("/tmp/piper.sock");
	#print("Added Socket")

#config = json.loads(open("kafka-config/conf.json").read())
#template = json.loads(open("event-template.json").read());
	init()
	print("[+] connecting to external services..");
	consumer = start_kafka();
	start_elastic()
	print(Fore.GREEN+"[+] kafka consumer enabled..")
	print(Fore.GREEN+"[+] Begin summarizer");
	print(Style.RESET_ALL)
	for msg in consumer:
		log(msg.value.decode());	
