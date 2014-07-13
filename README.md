Atoms Test Framework
=============

Small JavaScript library to record and simulate user input on web page.  The library is under development. 

How to record?
--------------

Include "AtomRecorder.js" on the page you want to perform testing.

Invoke method "AtomRecorder.start()" to record testing on JavaScript console.

Invoke method "AtomRecorder.stop()" to stop recording on JavaScript console.

Invoke "copy(JSON.stringify(AtomRecorder.steps))" and you will get recorded steps copied onto clipboard.

How to simulate?
----------------

Include "AtomRecorder.js" on the page you want to perform testing.

Invoke method "AtomRecorder.run(steps)", replace steps with the steps copied on the first step, invoke this on JavaScript console.
