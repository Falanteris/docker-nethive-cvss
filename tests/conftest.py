import pytest
import json
from utilities.LogFormatClass import LogFormatClass


@pytest.fixture(params=json.loads(open("params/params.json").read()), scope="class")
def config_merger_param(request):
    logger = LogFormatClass()
    request.cls.logger = logger.get_logger_format_default(logger_name="merger_test.log")
    yield request.param
    pass

@pytest.fixture(scope="class")
def config_integration_param(request):
    logger = LogFormatClass()
    request.cls.logger = logger.get_logger_format_default(logger_name="integrate_test.log")
