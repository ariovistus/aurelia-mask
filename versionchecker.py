import os
import json

tag = os.environ.get('TRAVIS_TAG', '')
if tag != '':
    with open('package.json') as f1:
        a = json.load(f1)
    if a['version'] != tag:
        with open('package.json', 'w') as f2:
            print("package.json version %s doesn't match tag %s - setting to %s" % (a['version'], tag, tag))
            a['version'] = tag
            json.dump(a, f2)
