# AWS S3 Storage Migration Guide

## 📋 Overview

ระบบปัจจุบันใช้ **local storage** (`/tmp/uploads` on Railway) ซึ่งเป็น **ephemeral storage** (ไฟล์หายเมื่อ container restart)

Guide นี้จะแนะนำวิธีย้ายไป **AWS S3** สำหรับ persistent storage

---

## ⚠️ ปัญหาของ Local Storage (ปัจจุบัน)

| ปัญหา | ผลกระทบ |
|-------|---------|
| **Ephemeral** | ไฟล์หายเมื่อ Railway restart/redeploy |
| **No Backup** | ไฟล์หายถาวร ไม่มี recovery |
| **Single Instance** | ไม่ scale ได้ถ้ามี multiple instances |
| **Limited Space** | /tmp มี quota จำกัด |

---

## ✅ ประโยชน์ของ S3

| Feature | ประโยชน์ |
|---------|---------|
| **Persistent** | ไฟล์ไม่หาย permanent storage |
| **Scalable** | รองรับไฟล์ได้ไม่จำกัด |
| **CDN Ready** | ใช้ร่วมกับ CloudFront = load เร็ว |
| **Backup** | มี versioning & lifecycle rules |
| **Multi-Region** | ดูรัน redundancy |
| **Cost-Effective** | ~$0.023/GB/month |

---

## 🚀 Migration Steps

### **1. Create S3 Bucket**

```bash
# ใช้ AWS Console หรือ AWS CLI
aws s3 mb s3://your-app-files --region ap-southeast-1
```

**Bucket Settings:**
- ✅ Block public access: **OFF** (สำหรับ public files)
  - หรือใช้ **Presigned URLs** (secure)
- ✅ Versioning: **Enable** (แนะนำ)
- ✅ Encryption: **Enable** (AES-256)

### **2. Configure CORS**

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": [
      "https://your-frontend.com",
      "https://your-admin.com"
    ],
    "ExposeHeaders": ["ETag"]
  }
]
```

### **3. Create IAM User**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-app-files",
        "arn:aws:s3:::your-app-files/*"
      ]
    }
  ]
}
```

บันทึก **Access Key ID** และ **Secret Access Key**

### **4. Install AWS SDK**

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### **5. Set Environment Variables**

```bash
# Railway/Production
STORAGE_TYPE=s3
AWS_REGION=ap-southeast-1
AWS_S3_BUCKET=your-app-files
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_CLOUDFRONT_URL=https://xxx.cloudfront.net  # Optional
```

### **6. Implement S3StorageService**

แก้ไฟล์: `src/common/services/s3-storage.service.ts`

```typescript
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

async saveBase64File(...) {
  // 1. Parse base64
  const buffer = Buffer.from(base64String, 'base64');

  // 2. Generate S3 key
  const key = `${brandCode}/${category}/${uuidv4()}.${ext}`;

  // 3. Upload to S3
  const client = new S3Client({ region: this.region });
  await client.send(new PutObjectCommand({
    Bucket: this.bucket,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
  }));

  // 4. Return URL
  return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
}
```

### **7. Update Module (Optional Factory Pattern)**

แก้: `src/common/common.module.ts`

```typescript
import { StorageService } from './services/storage.service';
import { S3StorageService } from './services/s3-storage.service';

@Module({
  providers: [
    {
      provide: 'IStorageService',
      useFactory: () => {
        const type = process.env.STORAGE_TYPE || 'local';
        return type === 's3'
          ? new S3StorageService()
          : new StorageService();
      },
    },
  ],
  exports: ['IStorageService'],
})
```

### **8. Test**

```bash
# Test upload
curl -X PATCH https://your-api.com/api/isuzu/test-drives/1/document \
  -H "Content-Type: application/json" \
  -d '{"licenseImage": "data:image/png;base64,..."}'

# ✅ File should be in S3
aws s3 ls s3://your-app-files/isuzu/licenses/
```

---

## 🌐 CloudFront CDN (Optional)

### **Why CloudFront?**
- ⚡ Fast global delivery
- 💰 Reduce S3 data transfer costs
- 🔒 Better security (HTTPS, signed URLs)

### **Setup:**

1. Create CloudFront Distribution
   - Origin: S3 bucket
   - Viewer Protocol: Redirect HTTP to HTTPS
   - Price Class: Use Only North America and Europe (cheaper)

2. Set env var:
   ```bash
   AWS_CLOUDFRONT_URL=https://dxxxxx.cloudfront.net
   ```

3. Update S3StorageService to use CloudFront URL

---

## 💰 Cost Estimation

### **S3 Pricing (ap-southeast-1)**

| Item | Price | Example Usage | Monthly Cost |
|------|-------|---------------|--------------|
| Storage | $0.023/GB | 10 GB files | $0.23 |
| PUT/POST | $0.005/1000 | 10K uploads | $0.05 |
| GET | $0.0004/1000 | 100K downloads | $0.04 |
| **Total** | | | **~$0.32/month** |

### **CloudFront (Optional)**

| Item | Price | Example | Monthly Cost |
|------|-------|---------|--------------|
| Data Transfer | $0.140/GB | 50 GB | $7.00 |
| Requests | $0.0075/10K | 500K requests | $0.38 |
| **Total** | | | **~$7.38/month** |

**💡 Tip:** Start with S3 only, add CloudFront later if needed

---

## 📊 Comparison

| Feature | Local (/tmp) | S3 | S3 + CloudFront |
|---------|--------------|----|-----------------|
| Persistent | ❌ | ✅ | ✅ |
| Backup | ❌ | ✅ | ✅ |
| Scalable | ❌ | ✅ | ✅ |
| Fast (Global) | ⚠️ | ⚠️ | ✅ |
| Cost | Free | ~$0.30/mo | ~$7/mo |
| Setup | ✅ Easy | ⚠️ Medium | ⚠️ Complex |

---

## 🔄 Rollback Plan

ถ้ามีปัญหากับ S3 rollback ได้ง่าย:

```bash
# เปลี่ยน env var กลับเป็น local
STORAGE_TYPE=local

# Redeploy → ใช้ local storage ต่อ
```

---

## 📚 References

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/)
- [CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)

---

## ✅ Checklist

- [ ] Create S3 bucket
- [ ] Configure bucket policy & CORS
- [ ] Create IAM user with S3 access
- [ ] Install `@aws-sdk/client-s3`
- [ ] Implement S3StorageService methods
- [ ] Set environment variables in Railway
- [ ] Test upload/download/delete
- [ ] (Optional) Setup CloudFront CDN
- [ ] Monitor S3 costs in AWS console

---

**Status:** 🚧 Prepared, not yet implemented
**Priority:** Medium (ทำเมื่อระบบมี users จำนวนมาก หรือต้องการ persistent storage)
