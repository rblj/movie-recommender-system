const express = require("express");
const bodyParser = require("body-parser");
const { exec } = require("child_process");
const path = require("path");
const port = 8383;
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the 'public/assets' folder
app.use('/assets', express.static(path.join(__dirname, 'public', 'assets')));

// Serve static files from the root folder for index.html
app.use(express.static(path.join(__dirname)));

// Render the index.html for the root route
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.post("/movie_recc", function (req, res) {
  const movie = req.body.Movie;
  const command = `python ./app.py ${JSON.stringify(movie)}`;

  exec(command, (error, stdout, stderr) => {
    if (error || stderr) {
      console.error(`Error: ${error || stderr}`);
      return res.status(500).send('An error occurred while processing your request.');
    }

    try {
      const recommendations = JSON.parse(stdout);
      const mov_ser = "Movie Selected:- " + movie.charAt(0).toUpperCase() + movie.slice(1);
      const params = {
        movie_searched: mov_ser,
        movie1: recommendations[0]?.trim() || "Not Available",
        movie2: recommendations[1]?.trim() || "Not Available",
        movie3: recommendations[2]?.trim() || "Not Available",
        movie4: recommendations[3]?.trim() || "Not Available",
        movie5: recommendations[4]?.trim() || "Not Available",
      };
      res.status(200).render("movie_recc.pug", { param: params });
    } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred while processing your request.');
    }
  });
});

app.listen(port, () => {
  console.log(`Server is started Successfully on ${port}`);
});

// Error handling middleware
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
