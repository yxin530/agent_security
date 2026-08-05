class User < ApplicationRecord
  def self.find_by_name(name)
    where("username = ?", name)
  end
end
