"""Remove non-embedded PDF fonts only when they never paint text.

Usage: python clean_unused_pdf_fonts.py input.pdf output.pdf
Requires pypdf. Refuses to remove any non-embedded font used by a text-show
operator. It preserves paths, images, embedded fonts, page boxes, and scaling.
"""
import argparse
import json
from pathlib import Path

from pypdf import PdfReader, PdfWriter
from pypdf.generic import ContentStream, NameObject


def embedded(font):
    font = font.get_object()
    descendants = font.get('/DescendantFonts', [font])
    for descendant in descendants:
        item = descendant.get_object()
        if item.get('/Subtype') == '/Type3':
            continue
        descriptor = item.get('/FontDescriptor')
        if not descriptor or not any(k in descriptor.get_object() for k in ('/FontFile', '/FontFile2', '/FontFile3')):
            return False
    return True


def clean(input_path, output_path):
    reader = PdfReader(input_path)
    writer = PdfWriter()
    writer.clone_document_from_reader(reader)
    removed = []
    visited = set()

    def process(owner, resources, is_page=False):
        resources = resources.get_object()
        fonts = resources.get('/Font')
        fonts = fonts.get_object() if fonts else {}
        targets = {name for name, ref in fonts.items() if not embedded(ref)}
        stream = owner.get_contents() if is_page else owner
        content = ContentStream(stream, writer)
        current = None
        stack = []
        kept = []
        for operands, operator in content.operations:
            if operator == b'q':
                stack.append(current)
            elif operator == b'Q':
                current = stack.pop() if stack else None
            elif operator == b'Tf':
                current = operands[0]
                if current in targets:
                    continue
            elif operator in (b'Tj', b'TJ', b"'", b'"') and current in targets:
                raise ValueError(f'Non-embedded font paints text; refusing cleanup: {current}')
            kept.append((operands, operator))
        for ref in resources.get('/XObject', {}).get_object().values() if '/XObject' in resources else []:
            obj = ref.get_object()
            if obj.get('/Subtype') == '/Form' and id(obj) not in visited:
                visited.add(id(obj))
                process(obj, obj.get('/Resources', resources))
        if targets:
            content.operations = kept
            if is_page:
                owner[NameObject('/Contents')] = writer._add_object(content)
            else:
                owner.set_data(content.get_data())
            for name in targets:
                removed.append(str(fonts[name].get_object().get('/BaseFont')))
                del fonts[name]

    for page in writer.pages:
        process(page, page['/Resources'], True)
    with Path(output_path).open('wb') as handle:
        writer.write(handle)
    return removed


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('input', type=Path)
    parser.add_argument('output', type=Path)
    args = parser.parse_args()
    print(json.dumps({'removed_unused_fonts': clean(args.input, args.output)}))
