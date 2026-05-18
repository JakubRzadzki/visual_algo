import subprocess
import os

def test_cpp_algorithms():
    algo_dir = os.path.dirname(__file__)
    cpp_files = [f for f in os.listdir(algo_dir) if f.endswith('.cpp')]
    
    for cpp_file in cpp_files:
        cpp_path = os.path.join(algo_dir, cpp_file)
        exe_path = os.path.join(algo_dir, 'a.exe')
        
        # Compile
        compile_res = subprocess.run(['g++', cpp_path, '-o', exe_path], capture_output=True, text=True)
        assert compile_res.returncode == 0, f"Failed to compile {cpp_file}:\n{compile_res.stderr}"
        
        # Run
        run_res = subprocess.run([exe_path], capture_output=True, text=True)
        assert run_res.returncode == 0, f"Execution failed for {cpp_file}:\n{run_res.stderr}"
        
        if os.path.exists(exe_path):
            os.remove(exe_path)
