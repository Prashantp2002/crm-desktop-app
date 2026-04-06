from pathlib import Path
p = Path('frontend/src/components/dashboard/TasksToDo.jsx')
t = p.read_text()
old = '      const res = await fetch("http://127.0.0.1:5000/api/tasks", {'
new = '      const res = await fetch("http://127.0.0.1:5000/api/tasks", {\n        method: "POST",\n        headers: {\n          "Content-Type": "application/json",\n          "Authorization": "Bearer " + localStorage.getItem("token"),\n        },'
if old not in t:
    raise SystemExit('pattern not found')
t = t.replace(old, new)
t = t.replace('          user_id: "c7a20bf1-f119-4cd4-b085-468e28163e2e",\n', '')
p.write_text(t)
print('patched')