.PHONY: demo check tables figures mind

PYTHON ?= python
MIND_ROOT ?= data/MINDsmall

demo:
	PYTHONPATH=src $(PYTHON) scripts/run_synthetic_demo.py

check:
	$(PYTHON) scripts/check_access_aggregates.py

tables:
	$(PYTHON) scripts/render_access_summary.py

figures:
	$(PYTHON) access/tools/make_figures.py

mind:
	$(PYTHON) scripts/run_mind_expanded_membership.py --mind-root "$(MIND_ROOT)" --output outputs/mind_expanded_final
