# LEE JAEHOON 프로필 사이트

정적 사이트(HTML 한 장)입니다. 빌드 과정 없이 그대로 배포됩니다.

## GitHub에 올리기
```
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/<내계정>/<저장소이름>.git
git push -u origin main
```

## Vercel 배포
1. vercel.com 로그인 → Add New → Project
2. 방금 올린 GitHub 저장소 Import
3. Framework Preset은 Other 그대로, Deploy 클릭

이후 `git push` 할 때마다 자동으로 재배포됩니다.
