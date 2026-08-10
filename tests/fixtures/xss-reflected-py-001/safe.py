from flask import render_template_string, request, escape; render_template_string(escape(f"Hello {request.args.get('name')}"))
