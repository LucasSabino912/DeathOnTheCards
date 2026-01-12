import "../../containers/loginScreen/LoginScreen.css";

export default function AvatarSelector({ selected, onChange, options }) {
  return (
    <div className="avatar-selector">
      {options.map((avatar) => (
        <button
          type="button"
          key={avatar.value}
          className={`avatar-btn ${selected === avatar.value ? 'selected' : ''}`}
          onClick={() => onChange(avatar.value)}
        >
          <img src={avatar.value} alt={avatar.value} />
        </button>
      ))}
    </div>
  );
}
