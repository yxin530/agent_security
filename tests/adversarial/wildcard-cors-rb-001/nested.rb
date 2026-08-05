def configure_cors(app)
  app.config.middleware.insert_before 0, Rack::Cors do
    allow do
      origins '*'
      resource '*', headers: :any, credentials: true
    end
  end
end
