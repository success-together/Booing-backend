const { default: mongoose } = require("mongoose");
const Fragments = require("../../Model/fragmentsModel/Fragments");

const isArray = (arr) => {
  return arr && typeof arr === "object" && Array.isArray(arr);
};

// (async () => {
//   console.log(await Fragments.find({}).sort("-created_at"));
// })();

const createDirectory = async (req, res, next) => {
  const { user_id, name, filesIds } = req.body;

  if (!user_id) {
    return res.status(401).json({
      status: "fail",
      message: "you must be logged in !",
    });
  }

  if (!name) {
    return res.status(403).json({
      status: "fail",
      message: "directory must have a name",
    });
  }

  if (!isArray(filesIds)) {
    return res.status(403).json({
      status: "fail",
      message: "filesIds must be an array",
    });
  }

  try {
    const directory = new Fragments({
      user_id,
      updates: [
        {
          fileName: name,
        },
      ],
      type: null,
      isDirectory: true,
    });

    await directory.save();

    await Promise.all(
      filesIds.map(
        async (fileId) =>
          await Fragments.findOneAndUpdate(
            { _id: fileId },
            { directory: directory.id, updated_at: new Date() }
          )
      )
    );

    res.status(200).json({
      status: "success",
      message: "directory has been created successfully !",
      data: directory,
    });
  } catch (e) {
    console.log({ error: e });
    res.status(500).json({
      status: "fail",
      message: "something went wrong",
    });
  }
};

const formatDirectory = (directory, extendedItems) => {
  return {
    id: directory._id,
    name: directory._doc.updates[0].fileName,
    createdAt: directory._doc.created_at,
    isDirectory: directory._doc.isDirectory,
    items: extendedItems
      ? directory._doc.items.map((subDirectory) =>
          subDirectory.isDirectory
            ? formatDirectory(subDirectory, false)
            : {
                id: subDirectory._id,
                name: subDirectory._doc.updates[0].fileName,
                createdAt: subDirectory._doc.created_at,
                isDirectory: false,
              }
        )
      : directory._doc.items.length,
  };
};

const getAllDirectories = async (req, res, next) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(401).json({
      status: "fail",
      message: "you must be logged in !",
    });
  }

  try {
    const directories = await Fragments.find({
      user_id,
      isDirectory: true,
      isDeleted: false,
    });

    res.status(200).json({
      status: "success",
      message: "data returned successfully",
      data: directories.map((directory) => formatDirectory(directory)),
    });
  } catch (e) {
    console.log({ error: e });
    res.status(500).json({
      status: "fail",
      message: "something went wrong",
    });
  }
};

const getDirectory = async (req, res, next) => {
  const { user_id } = req.body;
  const { id } = req.params;

  if (!user_id) {
    return res.status(401).json({
      status: "fail",
      message: "you must be logged in !",
    });
  }

  try {
    if (!id || id !== new mongoose.Types.ObjectId(id).toString()) {
      return res.status(403).json({
        status: "fail",
        message: "invalid directory id",
      });
    }

    const directory = await Fragments.findById(id);

    if (!directory) {
      res.status(403).json({
        status: "fail",
        message: "no directory with the given id",
      });
    }

    directory.openedAt = new Date();
    await directory.save({ validateBeforeSave: true });

    res.status(200).json({
      status: "success",
      data: formatDirectory(directory, true),
    });
  } catch (e) {
    console.log({ error: e });
    res.status(500).json({
      status: "fail",
      message: "something went wrong",
    });
  }
};

const getRecentDirectories = async (req, res, next) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(401).json({
      status: "fail",
      message: "you must be logged in !",
    });
  }

  try {
    const directories = await Fragments.find({
      user_id,
      isDirectory: true,
      isDeleted: false,
    })
      .sort("-openedAt")
      .limit(4);

    res.status(200).json({
      status: "success",
      message: "data returned successfully",
      data: directories.map((directory) => formatDirectory(directory)),
    });
  } catch (e) {
    console.log({ error: e });
    res.status(500).json({
      status: "fail",
      message: "something went wrong",
    });
  }
};

module.exports = {
  createDirectory,
  getAllDirectories,
  getDirectory,
  getRecentDirectories,
};
