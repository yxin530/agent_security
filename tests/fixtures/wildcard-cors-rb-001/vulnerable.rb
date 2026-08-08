allow do
  origins '*'
  resource '*', headers: :any, credentials: true
end
