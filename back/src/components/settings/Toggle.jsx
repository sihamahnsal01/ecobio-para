function Toggle({ on, onChange, disabled }) {
  return (
    <button
      type="button"
      className={`toggle${on ? ' on' : ''}`}
      onClick={() => !disabled && onChange(!on)}
      disabled={disabled}
    >
      <span />
    </button>
  )
}

export default Toggle
