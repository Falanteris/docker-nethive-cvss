import logging
import inspect

class LogFormatClass():
    def get_logger_format_default(self, **kwargs):
        logger_name = "{}.log".format(inspect.stack()[1][3])
        if "logger_name" in kwargs:
            logger_name = kwargs["logger_name"]
        logger = logging.getLogger(logger_name)
        formatter = logging.Formatter("%(asctime)s : %(levelname)s : %(name)s : %(message)s")
        file_handler = logging.FileHandler(logger_name)
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
        self.logger = logger
        self.set_level("DEBUG")
        return self.logger
    def set_level(self,level):
        switcher = {
            "DEBUG":logging.DEBUG,
            "INFO":logging.INFO,
            "WARNING":logging.WARNING,
            "ERROR": logging.ERROR,
            "CRITICAL": logging.CRITICAL,

        }
        self.logger.setLevel(switcher[level] or switcher["DEBUG"])
    def get_logger(self):
        return self.logger

    def get_logger_format_csv(self,**kwargs):
        logger_name = "{}.log".format(inspect.stack()[1][3])
        if "logger_name" in kwargs:
            logger_name = kwargs["logger_name"]
        
        logger = logging.getLogger(logger_name)
        formatter = logging.Formatter("%(asctime)s,%(levelname)s,%(name)s,%(message)s")
        file_handler = logging.FileHandler(logger_name)
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
        self.logger = logger
        return self.logger