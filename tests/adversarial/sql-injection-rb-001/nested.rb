class User < ApplicationRecord
  def self.find_by_name(name)
    def query(n)
      where("username = '#{n}'")
    end
    query(name)
  end
end
