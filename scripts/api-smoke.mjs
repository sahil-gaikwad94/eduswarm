process.env.NODE_ENV = 'test';
const { app } = await import('../apps/api/dist/server.js');
const server = app.listen(4310);
try {
  for (const path of ['/health', '/api/curriculum/gate-cs', '/api/curriculum/web-dev', '/api/curriculum/ai-ml', '/api/quiz/catalog?course=web-dev&source=practice&subject=Backend&topic=API%20Design', '/api/recommendations/videos?topicId=algo-complexity', '/api/session']) {
    const response = await fetch(`http://127.0.0.1:4310${path}`, { headers: { 'x-demo-user': 'qa-user' } });
    const body = await response.text();
    console.log(`${path} ${response.status} ${body.slice(0, 160)}`);
    if (!response.ok) process.exitCode = 1;
  }
} finally {
  await new Promise((resolve) => server.close(resolve));
}
