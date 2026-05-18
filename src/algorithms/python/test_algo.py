import subprocess
import os

def test_algorithms():
    algo_dir = os.path.join(os.path.dirname(__file__), 'src', 'algorithms', 'python')
    if not os.path.exists(algo_dir):
        # depending on where pytest runs
        algo_dir = os.path.join(os.path.dirname(__file__), 'python')
    if not os.path.exists(algo_dir):
        algo_dir = '.'
    
    scripts = [f for f in os.listdir(algo_dir) if f.endswith('.py') and f != 'test_algo.py']
    
    for script in scripts:
        script_path = os.path.join(algo_dir, script)
        result = subprocess.run(['python', script_path], capture_output=True, text=True)
        assert result.returncode == 0, f"Script {script} failed with error:\n{result.stderr}"
        assert len(result.stdout) > 0, f"Script {script} produced no output"
