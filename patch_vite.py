with open('vite.config.ts', 'r') as f:
    c = f.read()
c = c.replace('server: {', "server: { port: 3000, host: '0.0.0.0',")
with open('vite.config.ts', 'w') as f:
    f.write(c)
