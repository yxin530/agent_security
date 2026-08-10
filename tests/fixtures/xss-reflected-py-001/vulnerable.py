from flask import render_template_string, request; render_template_string(f"Hello {request.args.get('name')}")
