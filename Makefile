NGSPICE ?= ngspice
.PHONY: simulate test plot site
simulate:
	python3 simulate.py --ngspice $(NGSPICE)
test:
	node test-model.mjs
plot:
	python3 plot.py
site:
	node build.mjs
