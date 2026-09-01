"""Static server for the prototype that never lets the browser cache anything.

`python3 -m http.server` sends ETags, so `research-toolbar.js` and the stylesheet
inside `windows.html` come back from the browser's cache after an edit and the page
runs code that is no longer on disk. A cache-busting query on the document does not
help — the document's own <script src> has no query. Everything is served no-store
instead, which is right for a prototype and wrong for nothing here.
"""
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class NoCache(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, max-age=0')
        super().end_headers()


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 3400
    ThreadingHTTPServer(('127.0.0.1', port), NoCache).serve_forever()
