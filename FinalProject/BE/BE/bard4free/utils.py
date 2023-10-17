import re

def idCheck(*args):
    for arg in args:
        if not arg or not re.match(r'(c|r|rc)_[a-z0-9]{16}', arg):
            return False
    return True

