.PHONY: demo check check-data tables figures mind

PYTHON ?= python
MIND_ROOT ?= data/MINDsmall
ENCODER ?= sentence-transformers/all-MiniLM-L6-v2

demo:
	PYTHONPATH=src $(PYTHON) scripts/run_synthetic_demo.py

check:
	$(PYTHON) scripts/check_access_aggregates.py

# Anonymous ZIPs: schemas/arithmetic only, explicitly without file hashes.
check-data:
	$(PYTHON) scripts/check_access_aggregates.py --data-only

tables:
	$(PYTHON) scripts/render_access_summary.py

figures:
	$(PYTHON) access/tools/make_figures.py

mind:
	PYTHONPATH=src $(PYTHON) scripts/run_mind_proxy.py --mind-root "$(MIND_ROOT)" --encoder "$(ENCODER)"
