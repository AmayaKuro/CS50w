import re

def idCheck(*args):
    # TODO: check only [a-zA-Z0-9_]
    for arg in args:
        if not arg or not re.match(r'(c|r|rc)_[a-z0-9]{16}', arg):
            return False
    return True

