build:
	rm -rf ./dist
	./node_modules/.bin/babel src --out-dir dist --source-maps --ignore **/*.test.jsx,**/*.test.js,**/setupTest.js --copy-files
	@# --copy-files will bring in everything else that wasn't processed by babel. Remove what we don't want.
	@find dist -name '*.test.js*' -delete
