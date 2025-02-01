import React from "react";
import "../App.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const teamMembers = [
  {
    name: "Alp",
    description: "Sophomore - Computer Science @ Davidson College",
    email: "alniksarli@davidson.edu",
    image: "/images/alp.png",
  },
  {
    name: "Murtaza",
    description: "Sophomore - Computer Science @ Davidson College",
    email: "munikzad@davidson.edu",
    image: "/images/murtaza.jpeg",
  },
  {
    name: "Pacis",
    description: "Freshman - Computer Science @ Davidson College",
    email: "nkpacis@davidson.edu",
    image: "/images/pacis.png",
  },
  {
    name: "Philo",
    description: "Senior - Computer Science @ Davidson College",
    email: "phgabra@davidson.edu",
    image: "/images/philo.png",
  },
];

const Team = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br spyder-app text-white">
      <Navbar />
      <main className="flex-grow flex flex-col justify-center items-center px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Our Team</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-6xl">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="bg-opacity-70 rounded-lg p-4 flex flex-col items-center"
            >
              <img
                src={member.image}
                alt={member.name}
                className="rounded-full w-32 h-32 mb-4"
              />
              <h2 className="text-2xl mb-2">{member.name}</h2>
              <p className="text-center">{member.description}</p>
              <a
                href={`mailto:${member.email}`}
                className="mt-2 text-accent-color hover:underline"
              >
                {member.email}
              </a>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Team;
