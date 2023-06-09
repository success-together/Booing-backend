const mongoose = require("mongoose");
const isArray = require("../../Helpers/isArray");
const isObjectId = require("../../Helpers/isObjectId");
const Fragments = require("../../Model/fragmentsModel/Fragments");

const createDirectory = async (req, res, next) => {
  const { user_id, name, dir } = req.body;

  if (!isObjectId(user_id)) {
    return res.status(401).json({
      success: false,
      message: "you must be logged in !",
    });
  }

  if (!name || typeof name !== "string" || name.trim() === "") {
    return res.status(403).json({
      success: false,
      message: "directory must have a name",
    });
  }

  //check there is a directory with same name.
  const condition = {
    isDirectory: true,
    filename: name,
    type: null
  }
  if (dir === 'top') {
    condition.type = 'top';
  } else if (isObjectId(dir)) {
    condition.directory = dir;
  } else {
    condition.directory = null;
  }
  const exist = await Fragments.findOne(condition)
  if (exist) {
    return res.status(403).json({
      success: false,
      message: "There is already a directory with the same name.",
    });
  }

  try {
   
    const directory = new Fragments({
      user_id,
      filename: name,
      type: null,
      isDirectory: true,
      created_at: new Date(),
      openedAt: new Date()
    });
    if (dir === 'top') {
      directory.type = 'top';
    } else if (isObjectId(dir)) {
      directory.directory = dir;
    }

    await directory.save();

    res.status(200).json({
      success: true,
      message: "directory has been created successfully !",
      data: directory,
    });
  } catch (e) {
    console.log({ error: e });
    res.status(500).json({
      success: false,
      message: "something went wrong",
    });
  }
};

const formatDirectory = (directory, extendedItems) => {
  return {
    id: directory._id,
    name: directory.filename,
    createdAt: directory._doc.created_at,
    isDirectory: directory._doc.isDirectory,
    type: directory._doc.type,
    items: extendedItems
      ? directory._doc.items.map((subDirectory) =>
          subDirectory.isDirectory
            ? formatDirectory(subDirectory, false)
            : {
                id: subDirectory._id,
                name: subDirectory.filename,
                createdAt: subDirectory._doc.created_at,
                isDirectory: false,
                type: subDirectory._doc.type,
                uri: '',
                thumbnail: subDirectory._doc.thumbnail,
                updates: subDirectory._doc.updates,
                category: subDirectory._doc.category
              }
        )
      : directory._doc.items.length,
  };
};

const getAllDirectories = async (req, res, next) => {
  const { user_id } = req.body;

  if (!isObjectId(user_id)) {
    return res.status(401).json({
      success: false,
      message: "you must be logged in !",
    });
  }

  try {
    const directories = await Fragments.find({
      user_id,
      isDirectory: true,
      isDeleted: false,
      directory: null,
      type: null
    });

    res.status(200).json({
      success: true,
      message: "data returned successfully",
      data: directories.map((directory) => formatDirectory(directory)),
    });
  } catch (e) {
    console.log({ error: e });
    res.status(500).json({
      success: false,
      message: "something went wrong",
    });
  }
};

const getDirectory = async (req, res, next) => {
  const { user_id } = req.body;
  const { id } = req.params;

  if (!isObjectId(user_id)) {
    return res.status(401).json({
      success: false,
      message: "you must be logged in !",
    });
  }
  try {
    if (id !== 'top' && !isObjectId(id)) {
      return res.status(403).json({
        success: false,
        message: "invalid directory id",
      });
    }
    if (id === 'top') {
      const directories = await Fragments.find({type: 'top', user_id: user_id, isDeleted: false});
      const dirs = [];
      for (var i = 0; i < directories.length; i++) {
        dirs.push({
          id: directories[i]._id,
          name: directories[i].filename,
          createdAt: directories[i]._doc.created_at,
          isDirectory: directories[i]._doc.isDirectory,
          type: directories[i]._doc.type,  
          count: directories[i]._doc.items.length    
        })
      }
      res.status(200).json({
        success: true,
        data: dirs,
      });      
    } else {
      const directory = await Fragments.findById(id);

      if (!directory) {

        return res.status(403).json({
          success: false,

          message: "no directory with the given id",
        });
      }

      if (!directory.isDirectory) {
        return res.status(403).json({
          status: "fail",
          message: "the given id is not a folder",
        });
      }

      if (directory.user_id?.toString() !== user_id) {
        return res.status(403).json({
          status: "fail",
          message: "you dont have permission to view this folder",
        });
      }

      directory.openedAt = new Date();
      await directory.save({ validateBeforeSave: true });

      res.status(200).json({
        success: true,
        data: formatDirectory(directory, true),
      });

    }
  } catch (e) {
    console.log({ error: e });
    res.status(500).json({
      success: false,
      message: "something went wrong",
    });
  }
};

const deleteFolderRecursivly = async (directory) => {
  if (!directory) {
    return null;
  }
  directory.isDeleted = true;
  directory.expireAt = new Date();

  await Promise.all([
    directory.save(),
    Fragments.updateMany(
      {
        directory: directory._id,
        isDirectory: false,
        isDeleted: false,
      },
      {
        isDeleted: true,
        expireAt: new Date(),
      }
    ),
    Fragments.find({
      directory: directory._id,
      isDirectory: true,
      isDeleted: false,
    }).then(
      async (dirs) =>
        await Promise.all(dirs.map((dir) => deleteFolderRecursivly(dir)))
    ),
  ]);
};

const deleteDirectory = async (req, res, next) => {
  const { user_id } = req.body;
  const { id } = req.params;

  if (!isObjectId(user_id)) {
    return res.status(401).json({
      status: "fail",
      message: "you must be logged in !",
    });
  }

  try {
    if (!isObjectId(id)) {
      return res.status(403).json({
        status: "fail",
        message: "invalid directory id",
      });
    }

    const directory = await Fragments.findById(id);

    if (!directory) {
      return res.status(403).json({
        status: "fail",
        message: "no directory with the given id",
      });
    }

    if (!directory.isDirectory) {
      return res.status(403).json({
        status: "fail",
        message: "the given id is not a folder",
      });
    }

    if (directory.user_id?.toString() !== user_id) {
      return res.status(403).json({
        status: "fail",
        message: "you dont have permission to delete this folder",
      });
    }

    await deleteFolderRecursivly(directory);

    res.status(200).json({
      status: "success",
      message: "folder delete successfully",
    });
  } catch (e) {
    console.log({ error: e });
    res.status(500).json({
      status: "fail",
      message: "something went wrong",
    });
  }
};

const renameDirectory = async (req, res, next) => {
  const { user_id, newName } = req.body;
  const { id } = req.params;

  if (!isObjectId(user_id)) {
    return res.status(401).json({
      status: "fail",
      message: "you must be logged in !",
    });
  }

  if (!newName || typeof newName !== "string" || newName.trim() === "") {
    return res.status(401).json({
      status: "fail",
      message: "invalid new folder name",
    });
  }

  try {
    if (!isObjectId(id)) {
      return res.status(403).json({
        status: "fail",
        message: "invalid directory id",
      });
    }

    const directory = await Fragments.findById(id);

    if (!directory) {
      return res.status(403).json({
        status: "fail",
        message: "no directory with the given id",
      });
    }

    if (!directory.isDirectory) {
      return res.status(403).json({
        status: "fail",
        message: "the given id is not a folder",
      });
    }

    if (directory.user_id?.toString() !== user_id) {
      return res.status(403).json({
        status: "fail",
        message: "you dont have permission to rename this folder",
      });
    }
    directory.filename = newName;
  

    directory.markModified("updates");
    await directory.save();

    console.log(await Fragments.findOne({ _id: directory._id }));

    res.status(200).json({
      status: "success",
      message: "folder delete successfully",
    });
  } catch (e) {
    console.log({ error: e });
    res.status(500).json({
      status: "fail",
      message: "something went wrong",
    });
  }
};

const getItemName = (dir) => dir.filename;

const getCopyName = async (item) => {
  const itemName = getItemName(item);
  const items = await Fragments.find({
    user_id: item.user_id,
    _id: { $ne: item._id },
  }).sort("created_at");
  const previousCopies = items.filter((copy) =>
    getItemName(copy).startsWith(itemName)
  );
  if (previousCopies.length === 0) {
    return itemName + "(1)";
  }

  const lastCopy = previousCopies[previousCopies.length - 1];
  const copyNumber = +getItemName(lastCopy)
    .replace(itemName, "")
    .replace("(", "")
    .replace(")", "");
  return `${itemName}(${copyNumber + 1})`;
};

const deepDirCopy = async (directory, parentId) => {
  if (!directory) {
    return null;
  }

  const copyName = await getCopyName(directory);
  const copy = new Fragments({ ...directory.toObject(), _id: undefined });

  copy.filename = copyName;


  copy.directory = parentId;

  const promises = [Fragments.create(copy)];
  if (directory.isDirectory) {
    promises.push(
      Fragments.find({
        user_id: directory.user_id,
        directory: directory._id,
        isDeleted: false,
      }).then((items) =>
        Promise.all(items.map((item) => deepDirCopy(item, copy.id)))
      )
    );
  }

  await Promise.all(promises);
};

const copyDirectory = async (req, res, next) => {
  const { user_id } = req.body;
  const { id } = req.params;

  if (!isObjectId(user_id)) {
    return res.status(401).json({
      status: "fail",
      message: "you must be logged in !",
    });
  }

  try {
    if (!isObjectId(id)) {
      return res.status(403).json({
        status: "fail",
        message: "invalid directory id",
      });
    }

    const directory = await Fragments.findById(id);

    if (!directory) {
      return res.status(403).json({
        status: "fail",
        message: "no directory with the given id",
      });
    }

    if (!directory.isDirectory) {
      return res.status(403).json({
        status: "fail",
        message: "the given id is not a folder",
      });
    }

    if (directory.user_id?.toString() !== user_id) {
      return res.status(403).json({
        status: "fail",
        message: "you dont have permission to rename this folder",
      });
    }

    await deepDirCopy(directory);

    res.status(200).json({
      status: "success",
      message: "folder delete successfully",
    });
  } catch (e) {
    console.log({ error: e });
    res.status(500).json({
      status: "fail",
      message: "something went wrong",
    });
  }
};
const getCategoryInfo = async (req, res) => {
  const {user_id} = req.body;
  if (!isObjectId(user_id)) {
    return res.status(401).json({
      status: "fail",
      message: "you must be logged in !",
    });
  }

  const categoryInfo = await Fragments.aggregate([
    { $match: { user_id: mongoose.Types.ObjectId(user_id), isDeleted: false} },
    { $group: {_id: "$category", updated: {$max: "$created_at"}, count: { $sum: 1} } },
  ]);
  const others = await Fragments.find({user_id: mongoose.Types.ObjectId(user_id), isDeleted: false, type: null, directory: null});
  categoryInfo.push({"id": "others", count: others.length, updated: 0})
  return res.status(200).json({
    status: "success",
    data: categoryInfo
  })
}
const addFilesToDirectory = async (req, res, next) => {
  const { user_id, files_ids } = req.body;
  const { id } = req.params;

  if (!isObjectId(user_id)) {
    return res.status(401).json({
      status: "fail",
      message: "you must be logged in !",
    });
  }

  if (!isArray(files_ids) || files_ids.some((fileId) => !isObjectId(fileId))) {
    return res.status(403).json({
      status: "fail",
      message: "invalid files ids",
    });
  }

  try {
    if (!isObjectId(id)) {
      return res.status(403).json({
        status: "fail",
        message: "invalid directory id",
      });
    }

    const directory = await Fragments.findById(id);

    if (!directory) {
      return res.status(403).json({
        status: "fail",
        message: "no directory with the given id",
      });
    }

    if (!directory.isDirectory) {
      return res.status(403).json({
        status: "fail",
        message: "the given id is not a folder",
      });
    }

    if (files_ids.includes(directory._id.toString())) {
      return res.status(403).json({
        status: "fail",
        message: "cannot add the same directory to itself !!",
      });
    }

    if (files_ids.length)
      await Promise.all(
        files_ids.map(
          async (fileId) =>
            await Fragments.findOneAndUpdate(
              { _id: fileId },
              { directory: directory.id, updated_at: new Date() }
            )
        )
      );

    res.status(200).json({
      status: "success",
      message: "files added successfully",
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

const recentFiles = async (req, res) => {
  const { user_id } = req.body;

  if (!isObjectId(user_id)) {
    return res.status(401).json({
      success: false,
      message: "you must be logged in !",
    });
  }

  try {
    const directories = await Fragments.find({
      user_id,
      // isDirectory: true,
      isDeleted: false,
    }).populate('updates')
      .sort("-openedAt")
      .limit(6);

    res.status(200).json({
      success: true,
      message: "data returned successfully",
      data: directories.map((directory) => directory),
    });
  } catch (e) {
    console.log({ error: e });
    res.status(500).json({
      success: false,
      message: "something went wrong",
    });
  }
};

module.exports = {
  createDirectory,
  getAllDirectories,
  getDirectory,
  recentFiles,
  deleteDirectory,
  renameDirectory,
  copyDirectory,
  addFilesToDirectory,
  getCategoryInfo
};
