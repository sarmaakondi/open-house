const express = require("express");
const router = express.Router();

const Listing = require("../models/listing");

router.get("/", async (req, res) => {
  try {
    const populatedListings = await Listing.find({}).populate("owner");
    res.render("listings/index.ejs", { listings: populatedListings });
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

router.get("/new", (req, res) => {
  res.render("listings/new.ejs");
});

router.post("/", async (req, res) => {
  try {
    req.body.owner = req.session.user._id;
    await Listing.create(req.body);
    res.redirect("/listings");
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

router.get("/:id", async (req, res) => {
  try {
    const populatedListings = await Listing.findById(req.params.id).populate(
      "owner"
    );
    const userHasFavorited = populatedListings.favoritedByUsers.some((user) =>
      user.equals(req.session.user._id)
    );
    res.render("listings/show.ejs", {
      listing: populatedListings,
      userHasFavorited: userHasFavorited,
    });
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (listing.owner.equals(req.session.user._id)) {
      await listing.deleteOne();
      res.redirect("/listings");
    } else {
      res.send("You don't have permission to do that");
    }
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

router.get("/:id/edit", async (req, res) => {
  try {
    const currentListing = await Listing.findById(req.params.id);
    res.render("listings/edit.ejs", { listing: currentListing });
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

router.put("/:id", async (req, res) => {
  try {
    const currentListing = await Listing.findById(req.params.id);
    if (currentListing.owner.equals(req.session.user._id)) {
      await currentListing.updateOne(req.body);
      res.redirect("/listings");
    } else {
      res.send("You don't have permission to do that");
    }
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

router.post("/:id/favorited-by/:userId", async (req, res) => {
  try {
    await Listing.findByIdAndUpdate(req.params.id, {
      $push: { favoritedByUsers: req.params.userId },
    });
    res.redirect(`/listings/${req.params.id}`);
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

router.delete("/:id/favorited-by/:userId", async (req, res) => {
  try {
    await Listing.findByIdAndUpdate(req.params.id, {
      $pull: { favoritedByUsers: req.params.userId },
    });
    res.redirect(`/listings/${req.params.id}`);
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

module.exports = router;
