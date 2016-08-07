deploy: test zip upload copytoclipboard clean

test:
	npm test

test-w:
	npm run test-w

zip:
	zip -r -9 _upload.zip * -x '*.psd' -x '.git'

upload:
	aws s3api put-object --bucket caltrainupload --key code.zip --body ./_upload.zip

copytoclipboard:
	echo 'https://s3.amazonaws.com/caltrainupload/code.zip' | pbcopy

clean:
	rm ./_upload.zip
