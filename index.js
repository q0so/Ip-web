const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000; // Vercel سيحدد المنفذ تلقائيًا

app.use(express.static(path.join(__dirname, 'public')));

// تشغيل الخادم
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

// تصدير التطبيق ليعمل على Vercel
module.exports = app;
