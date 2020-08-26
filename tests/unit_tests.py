import pytest
import subprocess
import json
import os
import time
class TestNethiveCvss():
    def test_merger(self, config_merger_param):
        msg = config_merger_param
        output = subprocess.check_output(["node","merger.js",msg["vul"],msg["ip"],msg["url"]],cwd="../").decode()
        check = {}
        try:
            self.logger.info("Output is : {}".format(output))
            check = json.loads(output)
            assert check["errors"] == {}
            assert "undefined" not in check["vector"]            
        except Exception as e:
            self.logger.error("Error occured : ".format(e))
            raise Exception(e)
    
    def test_start_service(self, config_integration_param):
        subprocess.check_output(["forever", "start", "ws.js"],cwd="../")
        subprocess.check_output(["forever", "start", "updater.js"],cwd="../")
        subprocess.check_output(["forever", "start", "downloader.js"],cwd="../")
        output = subprocess.check_output(["forever","list"]).decode()
        print(output)
        time.sleep(1)
        try:
            assert "updater.js" in output
            
            assert "downloader.js" in output
            assert "ws.js" in output
            self.logger.info("Integration completed successfully")
        except Exception as e:
            self.logger.error(e)
            subprocess.check_output(["forever","stopall"])
            raise Exception(e)
            
        time.sleep(5)
        self.logger.info("Preparing cleanup...")
        subprocess.check_output(["forever","stopall"])
        try:
            subprocess.check_output(["rm","/tmp/piper.sock"])
            subprocess.check_output(["rm","/tmp/updater.sock"])
        except Exception as e:
            self.logger.debug("Sockets were deleted prematurely.. skipping")
        try:
            subprocess.check_output(["rm *.meta"],cwd="../",shell=True)
        except Exception as e:
            self.logger.debug("No .meta files were found.. skipping step")
        