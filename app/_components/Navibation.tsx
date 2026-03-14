import Image from "next/image";
import Link from "next/link";


function Navibation() {
  return (
    <nav className="z-10 text-xl">
      <ul className="flex gap-12 items-center">
        <li>
          <Link
            href="/login"
            className="hover:text-gray-300 transition-colors"
          >
            LogIn
          </Link>
        </li>
        <li>
          <Link
            href="/signUp"
            className="hover:text-accent-400 transition-colors"
          >
            SignUp
          </Link>
        </li>
        <li>
          <Link
            href="/account"
            className="hover:text-accent-400 transition-colors flex items-center gap-4"
          >
            <Image
              className="h-8 rounded-full"
              width={35}
              height={40}
              src="https://static.vecteezy.com/system/resources/previews/009/734/564/non_2x/default-avatar-profile-icon-of-social-media-user-vector.jpg"
              alt="Profile"
              referrerPolicy="no-referrer"
            />
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navibation;
