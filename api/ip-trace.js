// Vercel Serverless Function entry point
export default async function handler(req, res) {
  // 从请求的查询参数中获取 IP 和服务类型
  const ip = req.query.ip;
  const service = req.query.service || 'ip-api'; // 默认为 ip-api

  if (!ip) {
    // 如果没有提供 IP 参数，返回 400 错误
    return res.status(400).send('Missing IP parameter');
  }

  let apiUrl;
  let serviceName;

  if (service === 'ip-taobao') {
    apiUrl = `https://ip.taobao.com/outGetIpInfo?ip=${ip}&accessKey=alibaba-inc`;
    serviceName = 'ip.taobao.com';
  } else if (service === 'ip-api') {
    apiUrl = `http://ip-api.com/json/${ip}?lang=zh-CN`;
    serviceName = 'ip-api.com';
  } else {
    return res.status(400).send('Invalid service parameter. Use "ip-api" or "ip-taobao".');
  }

  try {
    // 发起请求到目标 API
    const apiResponse = await fetch(apiUrl);

    if (!apiResponse.ok) {
      // 如果上游 API 返回非 2xx 状态码
      const errorText = await apiResponse.text();
      console.error(`Error fetching from ${serviceName}: ${apiResponse.status} - ${errorText}`);
      return res.status(apiResponse.status).send(`Error fetching IP trace from upstream API (${serviceName}): ${errorText}`);
    }

    // 获取上游 API 的响应体
    const data = await apiResponse.json();

    // 将目标 API 的响应直接返回给前端
    return res.status(200).json(data);

  } catch (error) {
    console.error(`Error fetching from ${serviceName}:`, error);
    // 捕获网络或其他错误
    return res.status(500).send(`Error fetching IP trace from upstream API (${serviceName})`);
  }
}