module.exports = function (app,myDataBase,bcrypt,passport,objectId,GitHubStrategy,LocalStrategy) {

    app.use(session({
        secret: process.env.SESSION_SECRET,
        resave: true,
        saveUninitialized: true,
        cookie: { secure: false }
      }));
      app.use(passport.initialize());
      app.use(passport.session());
  // Define the Local strategy for username and password authentication
  passport.use(new LocalStrategy((username, password, done) => {
    myDataBase.findOne({ username: username }, (err, user) => {
      if (err) return done(err);
      if (!user) return done(null, false);
      if (!bcrypt.compareSync(password, user.password)) {
        return done(null, false);
      }
      return done(null, user);
    });
  }));
  // Define the GitHub strategy for authentication
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    const githubUsername = profile.username;
  
    try {
      const user = await findOrCreateUser(githubUsername, profile);
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));
  
  // ...
  
  // Helper function to find or create user based on GitHub username
  async function findOrCreateUser(githubUsername, profile) {
    const existingUser = await myDataBase.findOne({ username: githubUsername });
  
    if (existingUser) {
      return existingUser;
    }
  
    const newUser = {
      username: githubUsername,
      // Add other user data here
    };
  
    const insertResult = await myDataBase.insertOne(newUser);
    return insertResult.ops[0];
  }
  

  // Serialize user data
  passport.serializeUser((user, done) => {
    done(null, user._id); // Serialize using the user.id field
  });

  // Deserialize user data
  passport.deserializeUser((id, done) => {
    myDataBase.findOne({ _id: new objectId(id) }, (err, doc) => {
      done(err, doc);
    });
  });

  // Helper function to find or create user based on GitHub ID
  async function findOrCreateUser(githubUsername, profile) {
    const existingUser = await myDataBase.findOne({ username: githubUsername });
  
    if (existingUser) {
      return existingUser;
    }
  
    const newUser = {
      username: githubUsername,
      // Add other user data here
    };
  
    const insertResult = await myDataBase.insertOne(newUser);
    return insertResult.ops[0];
  }
};
