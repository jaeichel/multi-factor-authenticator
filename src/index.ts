import express from 'express';
import path from 'path';
import session from 'express-session';
import dotenv from 'dotenv';
import passport from 'passport';
import Auth0Strategy from 'passport-auth0';
import querystring from 'querystring';
import url from 'url';

// import jwt from 'express-jwt';
// import jwks from 'jwks-rsa';
// import jwtAuthz from 'express-jwt-authz';

import { Authenticator } from './authenticator';

dotenv.config();

const app = express();

app.use(function(_req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

/*
const jwtCheck = jwt({
    secret: jwks.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${process.env.AUTH0_DOMAIN!}/.well-known/jwks.json`
  }),
  audience: process.env.AUTH0_AUDIANCE!,
  issuer: `https://${process.env.AUTH0_DOMAIN!}/`,
  algorithms: ['RS256']
});
*/

const sess = {
  secret: process.env.AUTH0_SESS_SECRET!,
  cookie: {
    secure: true,
  },
  resave: false,
  saveUninitialized: true,
};
app.use(session(sess));

const strategy = new Auth0Strategy(
  {
    domain: process.env.AUTH0_DOMAIN!,
    clientID: process.env.AUTH0_CLIENT_ID!,
    clientSecret: process.env.AUTH0_CLIENT_SECRET!,
    callbackURL:
      process.env.AUTH0_CALLBACK_URL || 'http://localhost:3000/callback',
  },
  (_accessToken, _refreshToken, _extraParams, profile, done) => {
    // accessToken is the token to call Auth0 API (not needed in the most cases)
    // extraParams.id_token has the JSON Web Token
    // profile has all the information from the user
    return done(null, profile);
  }
);
passport.use(strategy);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

const authenticator = new Authenticator();

app.use(require('body-parser').json());

const createRouter = () => {
  const router = express.Router();
  router.get(
    '/login',
    passport.authenticate('auth0', {
      scope: 'openid email profile',
    }),
    function(_, res) {
      res.redirect('/');
    }
  );

  router.get('/callback', function(req, res, next) {
    passport.authenticate('auth0', function(err, user /*, info */) {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.redirect('/unauthorized');
      }
      req.logIn(user, function(err) {
        if (err) {
          return next(err);
        }
        const returnTo = req.session!.returnTo;
        delete req.session!.returnTo;
        res.redirect(returnTo || '/authorized');
      });
    })(req, res, next);
  });

  router.get('/logout', (req, res) => {
    req.logout();

    var returnTo = `${req.protocol}://${req.hostname}`;
    var port = req.connection.localPort;
    if (port !== undefined && port !== 80 && port !== 443) {
      returnTo += ':' + port;
    }
    var logoutURL = new url.URL(
      `https://${process.env.AUTH0_DOMAIN}/v2/logout`
    );
    var searchString = querystring.stringify({
      client_id: process.env.AUTH0_CLIENT_ID,
      returnTo: returnTo,
    });
    logoutURL.search = searchString;

    res.redirect(logoutURL.toString());
  });

  return router;
};

const secured = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (req.user) {
    return next();
  }
  req.session!.returnTo = req.originalUrl;
  res.redirect('/login');
};

app.use('/', createRouter());

app.post('/mfa', secured, (req, res) => {
  if (req.body.secret && req.body.secret !== '') {
    authenticator.setSite(req.body.url, req.body.secret);
  }
  res.send(
    JSON.stringify({
      url: req.body.url,
      token: authenticator.calcToken(req.body.url),
    })
  );
});

app.get('/', (_req, res) => {
  res.sendfile('index.html', { root: './assets/' });
});
app.get('/authorized', secured, (_req, res) => {
  res.sendfile('authorized.html', { root: './assets/' });
});
app.get('/unauthorized', (_req, res) => {
  res.sendfile('unauthorized.html', { root: './assets/' });
});
app.use(require('express-static')('./assets'));
app.listen(3000);

require('greenlock-express')
  .init({
    packageRoot: path.dirname(__dirname),
    configDir: './greenlock.d',
    maintainerEmail: process.env.EMAIL,
    cluster: false,
  })
  .serve(app);
