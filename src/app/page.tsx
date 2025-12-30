'use client';

import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <Container>
      <Header>
        <Title>메인 페이지</Title>
        <AuthSection>
          {isAuthenticated ? (
            <>
              <UserInfo>{user?.email}</UserInfo>
              <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
            </>
          ) : (
            <LoginButton onClick={() => router.push('/login')}>로그인</LoginButton>
          )}
        </AuthSection>
      </Header>

      <Content>

        <ButtonGrid>
          <FeatureCard onClick={() => router.push('/posts')}>
            <Icon>📋</Icon>
            <CardTitle>게시판</CardTitle>
            <CardDescription>
              게시글을 작성, 조회, 수정, 삭제할 수 있는 게시판입니다.
            </CardDescription>
          </FeatureCard>

          <FeatureCard onClick={() => router.push('/charts')}>
            <Icon>📊</Icon>
            <CardTitle>데이터 시각화</CardTitle>
            <CardDescription>
              다양한 차트로 데이터를 시각화하여 확인할 수 있습니다.
            </CardDescription>
          </FeatureCard>
        </ButtonGrid>
      </Content>
    </Container>
  );
}

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
`;

const Header = styled.header`
  max-width: 1200px;
  margin: 0 auto 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
`;

const Title = styled.h1`
  font-size: 36px;
  font-weight: 700;
  color: white;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const AuthSection = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const UserInfo = styled.span`
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
`;

const LoginButton = styled.button`
  padding: 12px 24px;
  background: white;
  color: #667eea;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const LogoutButton = styled.button`
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const ButtonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  max-width: 800px;
  margin: 0 auto;
`;

const FeatureCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 40px 30px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  }
`;

const Icon = styled.div`
  font-size: 64px;
  margin-bottom: 20px;
`;

const CardTitle = styled.h3`
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
`;

const CardDescription = styled.p`
  font-size: 16px;
  color: #666;
  line-height: 1.6;
  margin: 0;
`;
