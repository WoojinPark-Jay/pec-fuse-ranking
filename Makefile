.PHONY: demo tables legacy-tables mind

demo:
	PYTHONPATH=src python scripts/run_synthetic_demo.py

tables:
	python scripts/render_access_summary.py

legacy-tables:
	python scripts/render_paper_tables.py

mind:
	PYTHONPATH=src python scripts/run_mind_proxy.py --mind-root "$(MIND_ROOT)" --encoder "$(ENCODER)"
