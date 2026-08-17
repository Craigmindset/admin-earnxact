"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { CURRENCY_SYMBOL } from "@/lib/currency";
import { MdOndemandVideo, MdAdd, MdEdit, MdDelete, MdClose } from "react-icons/md";

interface Video {
  id: string;
  title: string;
  video_url: string;
  thumbnail_url: string;
  reward_amount: number;
  duration: string;
  is_active: boolean;
  created_at: string;
}

interface VideoFormData {
  title: string;
  video_url: string;
  thumbnail_url: string;
  reward_amount: number;
  duration: string;
  is_active: boolean;
}

export default function WatchAdsManagementPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [formData, setFormData] = useState<VideoFormData>({
    title: "",
    video_url: "",
    thumbnail_url: "",
    reward_amount: 50,
    duration: "30s",
    is_active: true,
  });
  const supabase = createClient();

  useEffect(() => {
    fetchVideos();
  }, []);

  async function fetchVideos() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("watch_ads_videos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error("Error fetching videos:", error);
      alert("Failed to fetch videos");
    } finally {
      setLoading(false);
    }
  }

  function handleAddNew() {
    setEditingVideo(null);
    setFormData({
      title: "",
      video_url: "",
      thumbnail_url: "",
      reward_amount: 50,
      duration: "30s",
      is_active: true,
    });
    setShowModal(true);
  }

  function handleEdit(video: Video) {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      video_url: video.video_url,
      thumbnail_url: video.thumbnail_url,
      reward_amount: video.reward_amount,
      duration: video.duration,
      is_active: video.is_active,
    });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      if (editingVideo) {
        // Update existing video
        const { error } = await supabase
          .from("watch_ads_videos")
          .update(formData)
          .eq("id", editingVideo.id);

        if (error) throw error;
        alert("Video updated successfully!");
      } else {
        // Create new video
        const { error } = await supabase
          .from("watch_ads_videos")
          .insert([formData]);

        if (error) throw error;
        alert("Video created successfully!");
      }

      setShowModal(false);
      fetchVideos();
    } catch (error) {
      console.error("Error saving video:", error);
      alert("Failed to save video");
    }
  }

  async function handleDelete(videoId: string) {
    if (!confirm("Are you sure you want to delete this video?")) return;

    try {
      const { error } = await supabase
        .from("watch_ads_videos")
        .delete()
        .eq("id", videoId);

      if (error) throw error;
      alert("Video deleted successfully!");
      fetchVideos();
    } catch (error) {
      console.error("Error deleting video:", error);
      alert("Failed to delete video");
    }
  }

  async function handleToggleActive(video: Video) {
    try {
      const { error } = await supabase
        .from("watch_ads_videos")
        .update({ is_active: !video.is_active })
        .eq("id", video.id);

      if (error) throw error;
      fetchVideos();
    } catch (error) {
      console.error("Error toggling video status:", error);
      alert("Failed to update video status");
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MdOndemandVideo className="text-3xl text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Videos Management
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Update video URL, thumbnail, title, and active status for the watch-and-earn library.
            </p>
          </div>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          <MdAdd className="text-xl" />
          Add Video
        </button>
      </div>

      {/* Videos Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-4">Loading videos...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Thumbnail
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Video URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Reward
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {videos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      No videos found. Click "Add Video" to create one.
                    </td>
                  </tr>
                ) : (
                  videos.map((video) => (
                    <tr key={video.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img
                          src={video.thumbnail_url}
                          alt={video.title}
                          className="w-20 h-12 object-cover rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {video.title}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                          {video.video_url}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-green-600">
                          {CURRENCY_SYMBOL}{Number(video.reward_amount).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Reference only
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {video.duration}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleActive(video)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            video.is_active
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {video.is_active ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(video)}
                            className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400"
                            title="Edit"
                          >
                            <MdEdit className="text-xl" />
                          </button>
                          <button
                            onClick={() => handleDelete(video.id)}
                            className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                            title="Delete"
                          >
                            <MdDelete className="text-xl" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingVideo ? "Edit Video" : "Add New Video"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <MdClose className="text-2xl text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Video Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Product Review Ad"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Video URL (Embed URL) *
                </label>
                <input
                  type="url"
                  required
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="https://www.youtube.com/embed/VIDEO_ID"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  For YouTube: Use embed URL format (youtube.com/embed/VIDEO_ID)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Thumbnail URL *
                </label>
                <input
                  type="url"
                  required
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  For YouTube: https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reference Amount ({CURRENCY_SYMBOL}) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.reward_amount}
                    onChange={(e) => setFormData({ ...formData, reward_amount: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Actual wallet credit is calculated from the member's plan and daily 60/40 split.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Duration *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., 30s, 1m"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Active (visible to users)
                </label>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  {editingVideo ? "Update Video" : "Create Video"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
