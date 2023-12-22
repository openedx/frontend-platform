# Documentation CLI usage: https://github.com/documentationjs/documentation/blob/master/docs/USAGE.md

doc_command = ./node_modules/.bin/documentation build src -g -c ./docs/documentation.config.yml -f md -o ./docs/_API-body.md --sort-order alpha
cat_docs_command = cat ./docs/_API-header.md ./docs/_API-body.md > ./docs/API.md

build:
	rm -rf types/*
	npx tsc

docs-build:
	${doc_command}
	${cat_docs_command}
	rm ./docs/_API-body.md

docs-watch:
	@echo "NOTE: Please load _API-body.md to see watch results."
	${doc_command} -w

docs-lint:
	./node_modules/.bin/documentation lint src
