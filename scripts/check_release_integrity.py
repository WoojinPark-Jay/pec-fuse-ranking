"""Validate release identity, all registered bytes, and active manuscript links.

Uses only the Python standard library. Run from a checkout or unpacked artifact.
Historical source snapshots and software versions are not manuscript revisions.
"""
from pathlib import Path
import hashlib
import json
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def validate():
    info = json.loads((ROOT / 'RELEASE_INFO.json').read_text())
    manifest = json.loads((ROOT / 'RELEASE_MANIFEST.json').read_text())
    errors = []
    current = info['manuscript_revision']
    artifact = info['artifact_revision']
    if manifest['revision'] != artifact:
        errors.append('Manifest revision differs from RELEASE_INFO.json')
    if manifest['file_count'] != len(manifest['files']):
        errors.append('Manifest file_count is incorrect')
    for name, expected in manifest['files'].items():
        path = ROOT / name
        if not path.is_file() or digest(path) != expected:
            errors.append('Missing or changed registered file: ' + name)
    for name, expected in info['historical_unlinked_files'].items():
        path = ROOT / name
        if not path.is_file() or digest(path) != expected:
            errors.append('Missing or changed historical file: ' + name)
    if info.get('manuscript_pdf'):
        pdf = ROOT / info['manuscript_pdf']
        if not pdf.is_file() or digest(pdf) != info['manuscript_pdf_sha256']:
            errors.append('Current manuscript PDF does not match release hash')
    if not info.get('manuscript_pdf'):
        for pattern in ('PEC-Fuse-manuscript-v*.pdf', 'paper-first-page-v*.png'):
            for path in (ROOT / 'tutorial/public').glob(pattern):
                errors.append('Unpublished manuscript asset in public directory: ' + path.name)

    provenance = json.loads((ROOT / 'access/RUNNER_PROVENANCE.json').read_text())
    for field, expected in [('manuscript_revision', current), ('artifact_revision', artifact)]:
        if provenance[field] != expected:
            errors.append('Runner provenance has stale ' + field)
    runner = ROOT / provenance['canonical_repository_runner']
    if digest(runner) != provenance['distributed_runner_hash']:
        errors.append('Distributed runner differs from its provenance hash')

    checked_labels = []
    for name in manifest['files']:
        path = ROOT / name
        if path.suffix not in {'.md', '.tsx', '.html'}:
            continue
        text = path.read_text()
        for match in re.finditer(r'\bv\d{2,3}\b', text):
            version = match.group()
            line = text[text.rfind('\n', 0, match.start())+1:text.find('\n', match.end()) if '\n' in text[match.end():] else len(text)]
            # An explicitly named historical generator is not a current label.
            if version != current and not re.search(r'(?:make_architecture_|architecture_native_|make_pool_reselection_)'+re.escape(version), line):
                errors.append('Stale manuscript label in ' + name + ': ' + version)
        if name.startswith('tutorial/src/'):
            for number in re.findall(r'[?&]v=(\d+)', text):
                if number != current[1:]:
                    errors.append('Stale preview cache revision in ' + name)
        checked_labels.append(name)

    registered = set(manifest['files']) | {'RELEASE_MANIFEST.json'} | set(info['historical_unlinked_files'])
    if (ROOT / '.git').exists():
        tracked = set(subprocess.check_output(['git','-C',str(ROOT),'ls-files'], text=True).splitlines())
        unknown = tracked - registered
    else:
        actual = {f.relative_to(ROOT).as_posix() for f in ROOT.rglob('*') if f.is_file() and '__pycache__' not in f.parts}
        unknown = actual - registered
    errors += ['Unclassified file: ' + name for name in sorted(unknown)]
    result = {'manuscript_revision':current,'artifact_revision':artifact,
              'registered_files':len(manifest['files']),
              'historical_unlinked_files':len(info['historical_unlinked_files']),
              'active_label_files_checked':len(checked_labels),
              'errors':errors,'status':'passed' if not errors else 'failed'}
    print(json.dumps(result,indent=2))
    if errors:
        raise SystemExit(1)


if __name__ == '__main__':
    validate()
