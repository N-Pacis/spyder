import React from "react";

const Footer = () => {
  return (
    <footer className="bg-black bg-opacity-50 py-6 px-8 flex flex-wrap justify-between items-start">
      <div className="w-full md:w-1/3 mb-6 md:mb-0">
        <div className="flex items-center mb-4">
          <h2 className="text-2xl font-bold mr-2">Spyder</h2>
          <img src="/images/spyder.png" alt="Spyder Logo" className="w-8 h-8" />
        </div>
        <div className="space-y-1 text-sm">
          <p>
            Alp{" "}
            <a href="mailto:alniksarli@davidson.edu">
              (alniksarli@davidson.edu)
            </a>
          </p>
          <p>
            Murtaza{" "}
            <a href="mailto:munikzad@davidson.edu">(alniksarli@davidson.edu)</a>
          </p>
          <p>
            Pacis{" "}
            <a href="mailto:nkpacis@davidson.edu">(alniksarli@davidson.edu)</a>
          </p>
          <p>
            Philo{" "}
            <a href="mailto:phgabra@davidson.edu">(alniksarli@davidson.edu)</a>
          </p>
        </div>
      </div>
      <div className="w-full md:w-2/3">
        <p className="mb-4 font-semibold text-2xl">Thanks to...</p>
        <div className="relative flex flex-wrap gap-4 h-full">
          <img
            src="/images/perplexity.png"
            alt="Perplexity"
            className="h-16 w-auto"
          />
          <img
            src="/images/perplexity2.png"
            alt="Perplexity"
            className="h-16 w-auto"
          />
          <img
            src="/images/terraform.png"
            alt="Terraform"
            className="h-16 w-auto"
          />
          <img
            src="/images/godaddy.png"
            alt="GoDaddy"
            className="h-16 w-auto"
          />
          <img src="/images/mongo.png" alt="Mongo" className="h-16 w-auto" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
