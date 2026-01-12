import { render, screen } from '@testing-library/react';
import ProfileCard from '../../components/lobby/ProfileCard';

test('muestra nombre, avatar y fecha', () => {
  render(
    <ProfileCard
      name="TestUser"
      avatar="avatar.png"
      birthdate="1990-01-01"
    />
  );
  expect(screen.getByText('TestUser')).toBeInTheDocument();
  expect(screen.getByText(/1990-01-01/)).toBeInTheDocument();
  expect(screen.getByAltText('TestUser')).toHaveAttribute('src', 'avatar.png');
});
