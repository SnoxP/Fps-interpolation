s = """\\["""
print(repr(s))
with open("test_str.txt", "w") as f:
    f.write(s)
