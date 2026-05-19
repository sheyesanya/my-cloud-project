import {
  useState
} from 'react';

import {
  useNavigate
} from 'react-router-dom';

import {
  useAuth
} from '../context/AuthContext';

export default function Login() {

  const navigate =
    useNavigate();

  const {

    login,

    signup,

    loginWithGoogle

  } = useAuth();

  const [email, setEmail]
    = useState('');

  const [password, setPassword]
    = useState('');

  const [loading, setLoading]
    = useState(false);

  const [error, setError]
    = useState('');

  const handleLogin =
    async (e) => {

      e.preventDefault();

      try {

        setLoading(true);

        setError('');

        await login(
          email,
          password
        );

        navigate('/dashboard');

      } catch (err) {

        setError(err.message);

      } finally {

        setLoading(false);
      }
    };

  const handleGoogle =
    async () => {

      try {

        setLoading(true);

        setError('');

        await loginWithGoogle();

        navigate('/dashboard');

      } catch (err) {

        setError(err.message);

      } finally {

        setLoading(false);
      }
    };

  const handleSignup =
    async () => {

      try {

        setLoading(true);

        setError('');

        await signup(
          email,
          password
        );

        navigate('/dashboard');

      } catch (err) {

        setError(err.message);

      } finally {

        setLoading(false);
      }
    };

  return (

    <div

      className="
        min-h-screen
        flex
        items-center
        justify-center
        px-4
        py-10
        relative
        overflow-hidden
      "

      style={{
        background:
          'linear-gradient(180deg,#f8fafc 0%,#eef2ff 50%,#fdf2f8 100%)'
      }}
    >

      {/* Glow */}

      <div

        className="
          absolute
          top-[-120px]
          right-[-120px]
          w-[320px]
          h-[320px]
          rounded-full
          blur-3xl
          opacity-30
        "

        style={{
          background:
            'linear-gradient(135deg,#8b5cf6,#ec4899,#06b6d4)'
        }}
      />

      <div

        className="
          absolute
          bottom-[-140px]
          left-[-120px]
          w-[300px]
          h-[300px]
          rounded-full
          blur-3xl
          opacity-20
        "

        style={{
          background:
            'linear-gradient(135deg,#06b6d4,#8b5cf6)'
        }}
      />

      {/* Card */}

      <div

        className="
          relative
          w-full
          max-w-md
          rounded-[36px]
          p-8
          md:p-10
        "

        style={{

          background:
            'rgba(255,255,255,0.72)',

          backdropFilter:
            'blur(22px)',

          border:
            '1px solid rgba(255,255,255,0.8)',

          boxShadow:
            '0 24px 70px rgba(15,23,42,0.08)',
        }}
      >

        {/* Logo */}

        <div className="text-center mb-8">

          <div
            className="
              flex
              justify-center
              mb-6
            "
          >

            <img

              src="https://res.cloudinary.com/dehap9dpe/image/upload/v1778828647/logo_ogcp4y.png"

              alt="BrandCasta"

              className="
                w-20
                h-20
                object-contain
              "
            />

          </div>

          <h1
            style={{

              fontFamily:
                'Fraunces, serif',

              fontSize:'40px',

              fontWeight:600,

              color:'#0f172a',

              letterSpacing:'-0.06em',

              lineHeight:1
            }}
          >
            BrandCasta
          </h1>

          <p
            style={{

              color:'#64748b',

              marginTop:'14px',

              fontSize:'14px',

              lineHeight:1.8
            }}
          >
            Media campaign operations
            built for modern brands,
            creators,
            and media teams.
          </p>

        </div>

        {/* Error */}

        {error && (

          <div

            style={{

              marginBottom:'18px',

              padding:'14px',

              borderRadius:'18px',

              background:
                'rgba(239,68,68,0.08)',

              color:'#dc2626',

              fontSize:'13px',

              border:
                '1px solid rgba(239,68,68,0.12)'
            }}
          >
            {error}
          </div>
        )}

        {/* Google */}

        <button

          onClick={handleGoogle}

          disabled={loading}

          className="
            w-full
            flex
            items-center
            justify-center
            gap-3
            py-3.5
            rounded-2xl
            transition-all
            duration-200
            mb-6
          "

          style={{

            background:'white',

            border:
              '1px solid rgba(226,232,240,0.9)',

            boxShadow:
              '0 6px 18px rgba(15,23,42,0.04)',

            fontWeight:700,

            color:'#0f172a'
          }}
        >

          <svg
            width="18"
            height="18"
            viewBox="0 0 48 48"
          >
            <path
              fill="#FFC107"
              d="M43.611 20.083H42V20H24v8h11.303C33.651 32.657 29.24 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.27 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
            />
          </svg>

          Continue with Google

        </button>

        {/* Divider */}

        <div
          className="
            flex
            items-center
            gap-4
            mb-6
          "
        >

          <div className="flex-1 h-px bg-slate-200"/>

          <p
            style={{

              fontSize:'10px',

              color:'#94a3b8',

              fontWeight:700,

              letterSpacing:'0.12em'
            }}
          >
            OR CONTINUE WITH EMAIL
          </p>

          <div className="flex-1 h-px bg-slate-200"/>

        </div>

        {/* Form */}

        <form
          onSubmit={handleLogin}
          className="space-y-4"
        >

          <input

            type="email"

            placeholder="Email Address"

            value={email}

            onChange={(e)=>
              setEmail(
                e.target.value
              )
            }

            className="
              form-input
              py-3.5
            "
          />

          <input

            type="password"

            placeholder="Password"

            value={password}

            onChange={(e)=>
              setPassword(
                e.target.value
              )
            }

            className="
              form-input
              py-3.5
            "
          />

          <button

            type="submit"

            disabled={loading}

            className="
              btn-primary
              w-full
              justify-center
              py-3.5
              rounded-2xl
            "
          >

            {loading

              ? 'Authenticating...'

              : 'Login'}
          </button>

        </form>

        {/* Signup */}

        <button

          onClick={handleSignup}

          disabled={loading}

          className="
            w-full
            mt-5
            text-sm
            font-semibold
            transition-all
          "

          style={{
            color:'#7c3aed'
          }}
        >
          Create a new account
        </button>

      </div>

    </div>
  );
}