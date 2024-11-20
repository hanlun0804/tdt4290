from dataclasses import dataclass
from enum import Enum


class State(Enum):
    """ Internal state of the manager

    INIT: ask for id number

    NAME_CONFIRM: see if the given id is correct.

    --- The states above all indicate that the customer is unidentified --- 

    IDENTIFIED: in the process of asking verification questions

    DONE_VERIFIED and DONE_UNVERIFIED: the process is complete
    """
    INIT = 0
    NAME_CONFIRM = 1
    IDENTIFIED = 2      
    DONE_VERIFIED = 3     
    DONE_UNVERIFIED = 4      

class Info(Enum):
    # The types of info that can be requested
    # Can not be shown due to NDA
    pass

class QuestionType(Enum):
    INIT = 0
    DATE = 1
    NUMBER = 2
    NAME = 3
    PERSON_ID = 4

@dataclass
class Question:
    text: str
    type: QuestionType
    info: list
    recording_id: int

@dataclass
class VoicebotResponse:
    # Structure of the response from the voicebot
    # Can not be shown due to NDA
    pass
        