# GloPick_BE
🚀 Git Convention
팀 협업을 원활하게 진행하기 위해 Git 컨벤션을 아래와 같이 정합니다.

📌 브랜치 전략
브랜치 생성 규칙
main : 최종 배포 브랜치
feat/#이슈번호 : 새로운 기능 개발을 위한 브랜치
fix/#이슈번호 : 버그 수정 브랜치

📌 커밋 메시지 규칙
Type: Subject (#이슈번호)
예시: feat: 로그인 기능 추가 (#12)
Type: 커밋의 목적을 나타내는 태그 (예: feat, fix, docs 등)
Subject: 변경 사항에 대한 간결한 설명을 작성
#이슈번호: 관련 이슈 번호를 포함
커밋 메시지 타입
타입	설명
feat	새로운 기능 추가
fix	버그 수정
docs	문서 수정 (README 등)
style	코드 스타일 변경 (세미콜론 추가 등 기능 변경 없음)
refactor	코드 리팩토링 (기능 변경 없음)
test	테스트 코드 추가
chore	기타 작업 (빌드 설정 변경, 패키지 설치 등)

📌 이슈 관리 규칙
이슈 제목 규칙
[태그] 이슈 제목
예시: [feat] 카카오 로그인 구현
[feat] 새로운 기능 개발
[fix] 버그 수정
[docs] 문서 수정
[refactor] 리팩토링
[test] 테스트 코드 추가
[chore] 기타
이슈 본문 템플릿


📌 PR(Pull Request) 규칙
PR 제목 규칙
[태그] 작업 내용 (#이슈번호)
예시: [feat] 회원가입 API 연동 (#15)
PR 본문 템플릿
